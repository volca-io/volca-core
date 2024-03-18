import { CustomContext } from '../../types';
import { useApiAction } from '../utils/api-action';

export const action = useApiAction(async (ctx: CustomContext) => {
  const {
    dependencies: {
      services: { statusService },
    },
  } = ctx;

  const body = await statusService.get();

  return {
    body,
  };
});
