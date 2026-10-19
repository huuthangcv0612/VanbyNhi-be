import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service.js';
import { ClassesController } from './classes.controller.js';
import { TeacherClassesService } from './teacher-classes.service.js';
import { TeacherClassesController } from './teacher-classes.controller.js';
import { StudentClassesService } from './student-classes.service.js';
import { StudentClassesController } from './student-classes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { GoogleModule } from '../google/google.module.js';

@Module({
  imports: [PrismaModule, AuthModule, SessionsModule, GoogleModule],
  controllers: [
    ClassesController,
    TeacherClassesController,
    StudentClassesController,
  ],
  providers: [ClassesService, TeacherClassesService, StudentClassesService],
  exports: [ClassesService, TeacherClassesService, StudentClassesService],
})
export class ClassesModule {}
