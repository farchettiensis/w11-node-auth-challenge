import plugin from 'fastify-plugin';
import * as DealershipController from './controllers/dealershipController.js';
import * as UsersController from './controllers/usersController.js';
import * as VehiclesController from './controllers/vehiclesController.js';
import {
  adminOnly,
  authValidation,
  dealershipOnly,
} from './policies/authPolicies.js';

const router = plugin(async (server, _) => {
  server.get('/', VehiclesController.index);
  server.get('/vehicles', VehiclesController.index);

  server.get(
    '/dealerships',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.index,
  );
  server.get(
    '/dealerships/create',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.create,
  );
  server.post<{ Body: { name: string } }>(
    '/dealerships',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.store,
  );
  server.get<{ Params: { id: string } }>(
    '/dealerships/:id/edit',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.edit,
  );
  server.post<{
    Params: { id: string };
    Body: { name: string };
  }>(
    '/dealerships/:id',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.update,
  );
  server.get<{ Params: { id: string } }>(
    '/dealerships/:id/delete',
    { preHandler: [authValidation, adminOnly] },
    DealershipController.destroy,
  );

  server.get(
    '/vehicles/create',
    { preHandler: [authValidation, dealershipOnly] },
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
  }>(
    '/vehicles',
    { preHandler: [authValidation, dealershipOnly] },
    VehiclesController.store,
  );
  server.get<{ Params: { id: string } }>(
    '/vehicles/:id/edit',
    { preHandler: [authValidation, dealershipOnly] },
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
    { preHandler: [authValidation, dealershipOnly] },
    VehiclesController.update,
  );
  server.get<{ Params: { id: string } }>(
    '/vehicles/:id/delete',
    { preHandler: [authValidation, dealershipOnly] },
    VehiclesController.destroy,
  );

  server.get(
    '/users',
    { preHandler: [authValidation, adminOnly] },
    UsersController.index,
  );
  server.get(
    '/users/create',
    { preHandler: [authValidation, adminOnly] },
    UsersController.create,
  );
  server.post(
    '/users',
    { preHandler: [authValidation, adminOnly] },
    UsersController.store,
  );
  server.get<{ Params: { id: string } }>(
    '/users/:id/edit',
    { preHandler: [authValidation, adminOnly] },
    UsersController.edit,
  );
  server.post<{ Params: { id: string } }>(
    '/users/:id',
    { preHandler: [authValidation, adminOnly] },
    UsersController.update,
  );
});

export { router };
