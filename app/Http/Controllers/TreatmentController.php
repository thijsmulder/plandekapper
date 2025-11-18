<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Treatment;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentController extends Controller
{
    use AuthorizesRequests;

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Treatment::class);

        $treatments = Treatment::with(['category:id,name'])
            ->select(['id', 'name', 'duration_in_minutes', 'price', 'category_id'])
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'duration_in_minutes' => $t->duration_in_minutes,
                'price' => $t->price,
                'category' => $t->category?->only(['id', 'name']),
            ]);

        return Inertia::render('treatments/index', [
            'treatments' => $treatments,
        ]);
    }

    /**
     * @param Treatment $treatment
     * @return Response
     * @throws AuthorizationException
     */
    public function show(Treatment $treatment): Response
    {
        $this->authorize('view', $treatment);

        $treatment->loadMissing('category:id,name');

        $data = [
            'id' => $treatment->id,
            'name' => $treatment->name,
            'duration_in_minutes' => $treatment->duration_in_minutes,
            'price' => $treatment->price,
            'description' => $treatment->description,
            'active' => $treatment->active,
            'category' => $treatment->category?->only(['id', 'name']),
        ];

        return Inertia::render('treatments/show', [
            'treatments' => $data,
        ]);
    }

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function create(): Response
    {
        $this->authorize('create', Treatment::class);

        $categories = cache()->remember('categories_dropdown', 60 * 60, function () {
            return Category::select('id', 'name')->orderBy('name')->get();
        });

        return Inertia::render('treatments/edit', [
            'treatment' => null,
            'categories' => $categories,
        ]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Treatment::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'duration_in_minutes' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'active' => ['required', 'boolean'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $validated['description'] = $validated['description'] ?? null;

        try {
            Treatment::create($validated);

            return redirect()
                ->route('treatments.index')
                ->with('flash.success', 'Behandeling succesvol aangemaakt');

        } catch (\Throwable $e) {
            Log::error('Fout bij aanmaken behandeling', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
                'input' => $request->except(['_token']),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Treatment $treatment
     * @return Response
     * @throws AuthorizationException
     */
    public function edit(Treatment $treatment): Response
    {
        $this->authorize('update', $treatment);

        if (!$treatment->relationLoaded('category')) {
            $treatment->load('category:id,name');
        }

        $categories = Category::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('treatments/edit', [
            'treatment' => [
                'id' => $treatment->id,
                'name' => $treatment->name,
                'duration_in_minutes' => $treatment->duration_in_minutes,
                'price' => $treatment->price,
                'description' => $treatment->description,
                'active' => $treatment->active,
                'category' => $treatment->category ? [
                    'id' => $treatment->category->id,
                    'name' => $treatment->category->name,
                ] : null,
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * @param Request $request
     * @param Treatment $treatment
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function update(Request $request, Treatment $treatment): RedirectResponse
    {
        $this->authorize('update', $treatment);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'duration_in_minutes' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'active' => ['required', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $validated['description'] = $validated['description'] ?? null;

        try {
            $treatment->update($validated);

            return redirect()
                ->route('treatments.index')
                ->with('flash.success', 'Behandeling succesvol opgeslagen');

        } catch (\Throwable $exception) {
            Log::error('Fout bij bijwerken behandeling', [
                'message' => $exception->getMessage(),
                'treatment_id' => $treatment->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->route('treatments.edit', $treatment->id)
                ->withInput()
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Treatment $treatment
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function destroy(Treatment $treatment): RedirectResponse
    {
        $this->authorize('delete', $treatment);

        try {
            $treatment->delete();

            return redirect()
                ->route('treatments.index')
                ->with('flash.success', 'Behandeling succesvol verwijderd');
        } catch (\Throwable $e) {
            Log::error('Fout bij verwijderen behandeling', [
                'message' => $e->getMessage(),
                'treatment_id' => $treatment->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->route('treatments.index')
                ->with('flash.error', 'Verwijderen is mislukt, probeer het opnieuw');
        }
    }
}
