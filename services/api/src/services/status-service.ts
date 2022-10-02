import { injectable } from 'tsyringe';

type Status = {
  status: string;
};

@injectable()
export class StatusService {
  public async get(): Promise<Status> {
    return {
      status: 'OK',
    };
  }
}
