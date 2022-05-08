import { myCtx } from '../myCtx';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<myCtx> = ({ context }, next) => {
    //@ts-ignore
    if (!context.req.session.userId) {
        throw new Error('Not Authenticated');
    }
    return next();
};
