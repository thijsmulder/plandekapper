<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Treatment;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    use AuthorizesRequests;

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Employee::class);

        $employees = Employee::query()
            ->select('id', 'first_name', 'infix', 'last_name', 'phone', 'email')
            ->orderBy('first_name')
            ->get()
            ->map(fn($employee) => [
                'id' => $employee->id,
                'name' => trim("{$employee->first_name} {$employee->infix} {$employee->last_name}"),
                'phone' => $employee->phone,
                'email' => $employee->email,
            ]);

        return Inertia::render('employees/index', [
            'employees' => $employees,
        ]);
    }

    /**
     * @param Employee $employee
     * @return Response
     * @throws AuthorizationException
     */
    public function show(Employee $employee): Response
    {
        $this->authorize('view', $employee);

        return Inertia::render('employees/show', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'infix' => $employee->infix,
                'last_name' => $employee->last_name,
                'phone' => $employee->phone,
                'email' => $employee->email,
            ],
        ]);
    }

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        $treatments = Treatment::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('employees/edit', [
            'employee' => null,
            'treatments' => $treatments,
        ]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'infix' => ['nullable', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
            'treatment_ids' => ['nullable', 'array'],
            'treatment_ids.*' => ['required', 'integer', 'exists:treatments,id'],
        ]);

        DB::beginTransaction();

        try {
            $employee = Employee::create([
                'first_name' => $validated['first_name'],
                'infix' => $validated['infix'] ?? null,
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
            ]);

            if (!empty($validated['treatment_ids'])) {
                $employee->treatments()->sync($validated['treatment_ids']);
            }

            DB::commit();

            return redirect()
                ->route('employees.index')
                ->with('flash.success', 'Medewerker succesvol aangemaakt');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Employee store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return redirect()
                ->route('employees.create')
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Employee $employee
     * @return Response
     * @throws AuthorizationException
     */
    public function edit(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        // Laad enkel de benodigde treatment-IDs met eager loading
        $employee->loadMissing('treatments:id');

        return Inertia::render('employees/edit', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'infix' => $employee->infix,
                'last_name' => $employee->last_name,
                'phone' => $employee->phone,
                'email' => $employee->email,
                'active' => $employee->active,
                'treatment_ids' => $employee->treatments->pluck('id'),
            ],
            'treatments' => Treatment::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'infix' => ['nullable', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'treatment_ids' => ['nullable', 'array'],
            'treatment_ids.*' => ['integer', Rule::exists('treatments', 'id')],
        ]);

        DB::beginTransaction();

        try {
            $employee->update($validated);

            $employee->treatments()->sync($validated['treatment_ids'] ?? []);

            DB::commit();

            return redirect()
                ->route('employees.index')
                ->with('flash.success', 'Medewerker succesvol opgeslagen');
        } catch (\Throwable $exception) {
            DB::rollBack();
            Log::error('Medewerker update mislukt', [
                'employee_id' => $employee->id,
                'message' => $exception->getMessage(),
            ]);

            return redirect()
                ->route('employees.edit', $employee->id)
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Employee $employee
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        try {
            $employee->delete();

            return redirect()
                ->route('employees.index')
                ->with('flash.success', 'Medewerker succesvol verwijderd');
        } catch (\Throwable $e) {
            Log::error('Fout bij verwijderen medewerker', [
                'message' => $e->getMessage(),
                'employee_id' => $employee->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->route('employees.index')
                ->with('flash.error', 'Verwijderen is mislukt, probeer het opnieuw');
        }
    }
}
