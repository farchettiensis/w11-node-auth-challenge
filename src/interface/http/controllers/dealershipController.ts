import { handler } from '../../../_lib/http/handler.js';
import { DealershipModel } from '../../../infrastructure/database/models/DealershipModel.js';

const index = handler(async (_request, reply) => {
  const dealerships = await DealershipModel.query();

  return reply.view('dealerships/index', { dealerships });
});

const create = handler(async (_request, reply) => {
  return reply.view('dealerships/create', {
    dealership: new DealershipModel(),
  });
});

const store = handler<{ Body: { name: string } }>(async (request, reply) => {
  const { name } = request.body;

  try {
    await DealershipModel.query().insert({ name });

    return reply.redirect('dealerships');
  } catch (error) {
    console.error(error);
    return reply.view('dealerships/create', {
      dealership: new DealershipModel().$set({ name }),
    });
  }
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const dealership = await DealershipModel.query()
    .findById(request.params.id)
    .throwIfNotFound();

  return reply.view('dealerships/update', { dealership });
});

const update = handler<{
  Params: { id: string };
  Body: { name: string };
}>(async (request, reply) => {
  const dealership = await DealershipModel.query()
    .findById(request.params.id)
    .throwIfNotFound();
  const { name } = request.body;
  const newDealership = dealership.$set({ name });

  try {
    await newDealership.$query().update();

    return reply.redirect('/dealerships');
  } catch (error) {
    console.error(error);
    return reply.view('dealerships/update', { dealership: newDealership });
  }
});

const destroy = handler<{ Params: { id: string } }>(async (request, reply) => {
  try {
    await DealershipModel.query()
      .findById(request.params.id)
      .throwIfNotFound()
      .delete();

    return reply.redirect('/dealerships');
  } catch (error) {
    console.error(error);
    return reply.redirect('/dealerships');
  }
});

export { index, create, store, edit, update, destroy };
