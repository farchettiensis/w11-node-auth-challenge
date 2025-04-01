import type { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';

type Handler<ReqOptions extends RouteGenericInterface = RouteGenericInterface> = (
  request: FastifyRequest<ReqOptions>,
  reply: FastifyReply,
) => Promise<unknown>;

const handler = <ReqOptions extends RouteGenericInterface>(h: Handler<ReqOptions>) => h;

export { handler, type Handler };
