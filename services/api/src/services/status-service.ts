type Status = {
  status: string;
};

export class StatusService {
  public async get(): Promise<Status> {
    return {
      status: 'OK',
    };
  }
}
