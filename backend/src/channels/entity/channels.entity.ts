import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('channels')
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @ManyToOne(() => Users, { onDelete: 'SET NULL' })
  owner: Users;

  @OneToMany(() => ChannelMembers, (cm) => cm.channel, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  channel_members: ChannelMembers[];

  @OneToMany(() => Messages, (message) => message.channel, {
    eager: true,
  })
  messages: Messages[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
