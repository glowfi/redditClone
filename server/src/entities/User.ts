import { Field, Int, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Post } from './Post';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
    @Column({ unique: true })
    username!: string;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Column()
    pass!: string;

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @Field(() => [Updoot])
    @OneToMany(() => Updoot, (updoot) => updoot.user)
    updoots: Updoot[];
}