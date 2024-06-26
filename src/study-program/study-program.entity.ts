import { BaseEntity } from 'src/base/base.entity';
import { UnitEntity } from 'src/unit/unit.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'study-program' })
export class StudyProgramEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'block_id' })
  blockId: number;

  @OneToMany(() => UnitEntity, (unit) => unit.studyProgram)
  public units: UnitEntity[];
}
