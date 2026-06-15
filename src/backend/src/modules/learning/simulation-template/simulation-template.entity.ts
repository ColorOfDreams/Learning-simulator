import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SimulationOutput,
  SimulationParameter,
} from './simulation-template.types';

@Entity('simulation_templates')
export class SimulationTemplateEntity {
  @PrimaryColumn({ name: 'simulation_id', type: 'varchar' })
  simulationId: string;

  @Column({ type: 'varchar', default: 'physics' })
  subject: string;

  @Column({ type: 'varchar' })
  topic: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'required_parameters',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  requiredParameters: string[];

  @Column({
    name: 'default_parameters',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  defaultParameters: SimulationParameter[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  outputs: SimulationOutput[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
