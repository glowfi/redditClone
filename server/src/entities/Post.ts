import { Field, Int, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Updoot } from './Updoot';
import { User } from './User';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    _id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => String)
    @Column()
    title!: string;

    @Field(() => String)
    @Column()
    text!: string;

    @Field(() => Int)
    @Column({ type: 'int', default: 0 })
    points!: number;

    @Field(() => Int)
    @Column()
    creatorId: number;

    @Field(() => Int, { nullable: true })
    voteStatus: null | number;

    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[];
}
