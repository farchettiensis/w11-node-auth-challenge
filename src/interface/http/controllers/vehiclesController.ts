import { handler } from '../../../_lib/http/handler.js';
import { VehicleModel } from '../../../infrastructure/database/models/VehicleModel.js';

const index = handler(async (_request, reply) => {
  const vehicles = await VehicleModel.query();

  return reply.view('vehicles/index', { vehicles });
});

const create = handler(async (_request, reply) => {
  return reply.view('vehicles/create', { vehicle: new VehicleModel() });
});

const store = handler<{
  Body: {
    name: string;
    brand: string;
    model: string;
    year: string;
    comments: string;
    dealershipId: number;
  };
}>(async (request, reply) => {
  const { name, brand, model, year, comments, dealershipId } = request.body;

  try {
    await VehicleModel.query().insert({
      name,
      brand,
      model,
      year,
      comments,
      dealershipId,
    });

    return reply.redirect('/vehicles');
  } catch (error) {
    console.error(error);
    return reply.view('vehicles/create', {
      vehicle: new VehicleModel().$set({
        name,
        brand,
        model,
        year,
        comments,
        dealershipId,
      }),
    });
  }
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const vehicle = await VehicleModel.query()
    .findById(request.params.id)
    .throwIfNotFound();

  return reply.view('vehicles/update', { vehicle });
});

const update = handler<{
  Params: { id: string };
  Body: {
    name: string;
    brand: string;
    model: string;
    year: string;
    comments: string;
    dealershipId: number;
  };
}>(async (request, reply) => {
  const vehicle = await VehicleModel.query()
    .findById(request.params.id)
    .throwIfNotFound();
  const { name, brand, model, year, comments, dealershipId } = request.body;
  const newVehicle = vehicle.$set({
    name,
    brand,
    model,
    year,
    comments,
    dealershipId,
  });

  try {
    await newVehicle.$query().update();

    return reply.redirect('/vehicles');
  } catch (error) {
    console.error(error);
    return reply.view('vehicles/update', { vehicle: newVehicle });
  }
});

const destroy = handler<{ Params: { id: string } }>(async (request, reply) => {
  try {
    await VehicleModel.query()
      .findById(request.params.id)
      .throwIfNotFound()
      .delete();

    return reply.redirect('/vehicles');
  } catch (error) {
    console.error(error);
    return reply.redirect('/vehicles');
  }
});

export { index, create, store, edit, update, destroy };
