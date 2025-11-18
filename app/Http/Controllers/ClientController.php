<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    use AuthorizesRequests;

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Client::class);

        $clients = Client::query()
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('clients/index', [
            'clients' => $clients,
        ]);
    }

    /**
     * @param Client $client
     * @return Response
     * @throws AuthorizationException
     */
    public function show(Client $client): Response
    {
        $this->authorize('view', $client);

        return Inertia::render('clients/show', [
            'client' => $client->only('id', 'name', 'email'),
        ]);
    }

    /**
     * @return Response
     * @throws AuthorizationException
     */
    public function create(): Response
    {
        $this->authorize('create', Client::class);

        return Inertia::render('clients/edit', [
            'client' => null,
        ]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Client::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['email', 'max:255', 'unique:clients,email'],
        ]);

        try {
            Client::create($validated);

            return redirect()
                ->route('clients.index')
                ->with('flash.success', 'Klant succesvol aangemaakt');
        } catch (\Throwable $e) {
            Log::error('Client store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return redirect()
                ->route('clients.create')
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Client $client
     * @return Response
     * @throws AuthorizationException
     */
    public function edit(Client $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('clients/edit', [
            'client' => $client->only('id', 'name', 'email', 'phone'),
        ]);
    }

    /**
     * @param Request $request
     * @param Client $client
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function update(Request $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('clients', 'email')->ignore($client->id)],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        try {
            $client->update($validated);

            return redirect()
                ->route('clients.index')
                ->with('flash.success', 'Klant succesvol opgeslagen');
        } catch (\Throwable $e) {
            Log::error('Client update error: ' . $e->getMessage(), [
                'client_id' => $client->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->route('clients.edit', $client->id)
                ->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param Client $client
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        try {
            $client->delete();

            return redirect()
                ->route('clients.index')
                ->with('flash.success', 'Klant succesvol verwijderd');
        } catch (\Throwable $e) {
            Log::error('Fout bij verwijderen klant', [
                'message' => $e->getMessage(),
                'client_id' => $client->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->route('clients.index')
                ->with('flash.error', 'Verwijderen is mislukt, probeer het opnieuw');
        }
    }
}
