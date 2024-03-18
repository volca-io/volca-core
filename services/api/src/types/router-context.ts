import { RouterContext } from '@koa/router';
import {
  AuthenticationService,
  CommunicationsService,
  ProjectInvitationService,
  ProjectService,
  ProjectUserService,
  StatusService,
  StripeService,
  UserService,
} from '../services';
import { Logger } from '../utils/logger';

export interface CustomContext extends RouterContext {
  correlationId: string;
  dependencies: {
    utils: {
      logger: Logger;
    };
    services: {
      authenticationService: AuthenticationService;
      communicationsService: CommunicationsService;
      projectService: ProjectService;
      projectInvitationService: ProjectInvitationService;
      projectUserService: ProjectUserService;
      statusService: StatusService;
      stripeService: StripeService;
      userService: UserService;
    };
  };
}
