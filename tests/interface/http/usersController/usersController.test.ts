import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser } from '../../../../src/application/useCases/user/createUser.js';
import { findUser } from '../../../../src/application/useCases/user/findUser.js';
import { findUsers } from '../../../../src/application/useCases/user/findUsers.js';
import { updateUser } from '../../../../src/application/useCases/user/updateUser.js';
import { UserModel } from '../../../../src/infrastructure/database/models/UserModel.js';
import * as UsersController from '../../../../src/interface/http/controllers/usersController.js';

vi.mock('../../../../src/application/useCases/user/updateUser.js');
vi.mock('../../../../src/application/useCases/user/findUser.js');
vi.mock('../../../../src/application/useCases/user/findUsers.js');
vi.mock('../../../../src/application/useCases/user/createUser.js');
vi.mock('./../../../src/infrastructure/database/models/UserModel.js');

describe('UserController', () => {
  describe('UsersController.index', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('renders users/index on success', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (findUsers as any).mockResolvedValue({
        success: true,
        data: [{ id: 1, name: 'John Doe' }],
      });

      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.index({} as any, reply as any);

      expect(reply.view).toHaveBeenCalledWith('users/index', {
        users: [{ id: 1, name: 'John Doe' }],
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });

    it('redirects to "users/" if findUsers fails', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (findUsers as any).mockResolvedValue({
        success: false,
        error: {
          code: 'ANY_ERROR',
          message: 'Something went wrong',
        },
      });

      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.index({} as any, reply as any);

      expect(reply.redirect).toHaveBeenCalledWith('users/');
      expect(reply.view).not.toHaveBeenCalled();
    });
  });

  describe('UsersController.create', () => {
    it('renders the "users/create" view with a new UserModel', async () => {
      const reply = { view: vi.fn() };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.create({} as any, reply as any);

      expect(reply.view).toHaveBeenCalledWith('users/create', {
        user: expect.any(UserModel),
      });
    });
  });

  describe('UsersController.store', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('re-renders the form if CreateUserSchema validation fails', async () => {
      const request = {
        body: {},
      };
      const reply = {
        view: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.store(request as any, reply as any);

      expect(reply.view).toHaveBeenCalledWith('users/create', {
        user: request.body,
      });
    });

    it('calls createUser and re-render form on failure', async () => {
      const requestBody = {
        name: 'Example',
        email: 'example@example.com',
        password: '123456',
        role: 'DEALERSHIP',
        dealershipId: '999',
      };
      const request = { body: requestBody };
      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (createUser as any).mockResolvedValue({
        success: false,
        error: {
          code: 'ANY_ERROR',
          message: 'Something went wrong',
        },
      });

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.store(request as any, reply as any);

      expect(reply.view).toHaveBeenCalledWith('users/create', {
        user: expect.any(UserModel),
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });

    it('calls createUser and redirect on success', async () => {
      const requestBody = {
        name: 'Example',
        email: 'example@example.com',
        password: '123456',
        role: 'ADMIN',
      };
      const request = { body: requestBody };
      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (createUser as any).mockResolvedValue({
        success: true,
        data: {},
      });

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.store(request as any, reply as any);

      expect(createUser).toHaveBeenCalledWith({
        name: 'Example',
        email: 'example@example.com',
        password: '123456',
        role: 'ADMIN',
        dealershipId: undefined,
      });

      expect(reply.redirect).toHaveBeenCalledWith('/users');
    });
  });

  describe('UsersController.update', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('re-renders the form if UpdateUserSchema validation fails', async () => {
      const request = {
        params: { id: '123' },
        body: {},
      };
      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.update(request as any, reply as any);

      expect(reply.view).toHaveBeenCalledWith('users/update', {
        user: request.body,
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });

    it('re-renders the form if updateUser returns a failure', async () => {
      const request = {
        params: { id: '123' },
        body: {
          name: 'Example',
          email: 'example@example.com',
          role: 'DEALERSHIP',
          dealershipId: '999',
        },
      };
      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (updateUser as any).mockResolvedValue({
        success: false,
        error: { code: 'INVALID', message: 'Some error from updateUser' },
      });

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.update(request as any, reply as any);

      expect(updateUser).toHaveBeenCalledWith(123, {
        name: 'Example',
        email: 'example@example.com',
        role: 'DEALERSHIP',
        dealershipId: 999,
      });
      expect(reply.view).toHaveBeenCalledWith('users/update', {
        user: request.body,
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });

    it('redirects to /users if updateUser succeeds', async () => {
      const request = {
        params: { id: '456' },
        body: {
          name: 'Example',
          email: 'example@example.com',
          role: 'ADMIN',
        },
      };
      const reply = {
        view: vi.fn(),
        redirect: vi.fn(),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (updateUser as any).mockResolvedValue({
        success: true,
        data: { id: 456, name: 'Example' },
      });

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.update(request as any, reply as any);

      expect(updateUser).toHaveBeenCalledWith(456, {
        name: 'Example',
        email: 'example@example.com',
        role: 'ADMIN',
        dealershipId: undefined,
      });
      expect(reply.redirect).toHaveBeenCalledWith('/users');
      expect(reply.view).not.toHaveBeenCalled();
    });
  });

  describe('UsersController.edit', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('renders users/update with the found user on success', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (findUser as any).mockResolvedValue({
        success: true,
        data: { id: 123, name: 'Example' },
      });

      const request = {
        params: { id: '123' },
      };
      const reply = { view: vi.fn(), redirect: vi.fn() };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.edit(request as any, reply as any);

      expect(findUser).toHaveBeenCalledWith(123);
      expect(reply.view).toHaveBeenCalledWith('users/update', {
        user: { id: 123, name: 'Example' },
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });

    it('redirects to "/users" if findUser fails', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (findUser as any).mockResolvedValue({
        success: false,
        error: {
          code: 'ANY_ERROR',
          message: 'Something went wrong',
        },
      });

      const request = { params: { id: '999' } };
      const reply = { view: vi.fn(), redirect: vi.fn() };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await UsersController.edit(request as any, reply as any);

      expect(findUser).toHaveBeenCalledWith(999);
      expect(reply.redirect).toHaveBeenCalledWith('/users');
      expect(reply.view).not.toHaveBeenCalled();
    });
  });
});
