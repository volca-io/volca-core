import { container } from 'tsyringe';

import { useApiAction } from '../utils/api-action';
import { StatusService } from '../../services';

export const action = useApiAction(async () => {
  const statusService = container.resolve(StatusService);
  const body = await statusService.get();

  return {
    body,
  };
});
