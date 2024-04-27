import { Controller, Get, Param } from '@nestjs/common';
import { UnitService } from './unit.service';
import { Auth } from 'src/libs/guard/guard';
import { ROLE } from 'src/shared/enum';

@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}
  @Get()
  @Auth([ROLE.TEACHER])
  findAll() {
    return this.unitService.findAll();
  }

  @Get('/unit-by-studyProgramId/:id')
  @Auth([ROLE.TEACHER])
  findAllUnitLessons(@Param('id') studyProgramId: string) {
    return this.unitService.findByStudyProgramId(+studyProgramId);
  }
}
