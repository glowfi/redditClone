import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HelloResolver {
    @Query(() => String)
    dispHello(): string {
        return 'hello';
    }
}
