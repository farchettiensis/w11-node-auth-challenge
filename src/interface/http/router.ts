import plugin from 'fastify-plugin';
import { authValidation } from './auth/auth.js';
import * as DealershipController from './controllers/dealershipController.js';
import * as UsersController from './controllers/usersController.js';
import * as VehiclesController from './controllers/vehiclesController.js';

const router = plugin(async (server, _) => {
  server.get('/', VehiclesController.index);
  server.get('/vehicles', VehiclesController.index);

  server.get(
    '/dealerships',
    { preHandler: authValidation },
    DealershipController.index,
  );
  server.get(
    '/dealerships/create',
    { preHandler: authValidation },
    DealershipController.create,
  );
  server.post<{ Body: { name: string } }>(
    '/dealerships',
    { preHandler: authValidation },
    DealershipController.store,
  );
  server.get<{ Params: { id: string } }>(
    '/dealerships/:id/edit',
    { preHandler: authValidation },
    DealershipController.edit,
  );
  server.post<{
    Params: { id: string };
    Body: { name: string };
  }>(
    '/dealerships/:id',
    { preHandler: authValidation },
    DealershipController.update,
  );
  server.get<{ Params: { id: string } }>(
    '/dealerships/:id/delete',
    { preHandler: authValidation },
    DealershipController.destroy,
  );

  server.get(
    '/vehicles/create',
    { preHandler: authValidation },
    VehiclesController.create,
  );
  server.post<{
    Body: {
      name: string;
      brand: string;
      model: string;
      year: string;
      comments: string;
      dealershipId: number;
    };
  }>('/vehicles', { preHandler: authValidation }, VehiclesController.store);
  server.get<{ Params: { id: string } }>(
    '/vehicles/:id/edit',
    { preHandler: authValidation },
    VehiclesController.edit,
  );
  server.post<{
    Params: { id: string };
    Body: {
      name: string;
      brand: string;
      model: string;
      year: string;
      comments: string;
      dealershipId: number;
    };
  }>(
    '/vehicles/:id',
    { preHandler: authValidation },
    VehiclesController.update,
  );
  server.get<{ Params: { id: string } }>(
    '/vehicles/:id/delete',
    { preHandler: authValidation },
    VehiclesController.destroy,
  );

  server.get('/users', { preHandler: authValidation }, UsersController.index);
  server.get(
    '/users/create',
    { preHandler: authValidation },
    UsersController.create,
  );
  server.post('/users', { preHandler: authValidation }, UsersController.store);
  server.get<{ Params: { id: string } }>(
    '/users/:id/edit',
    { preHandler: authValidation },
    UsersController.edit,
  );
  server.post<{ Params: { id: string } }>(
    '/users/:id',
    { preHandler: authValidation },
    UsersController.update,
  );
});

export { router };
