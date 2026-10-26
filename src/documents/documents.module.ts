import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DocumentsService } from './documents.service.js';
import { ClassMaterialsService } from './class-materials.service.js';
import { TeacherDocumentsController } from './teacher-documents.controller.js';
import { TeacherDocumentCategoriesController } from './teacher-document-categories.controller.js';
import { TeacherClassMaterialsController } from './teacher-class-materials.controller.js';
import { StudentMaterialsController } from './student-materials.controller.js';

import { DocumentsController } from './documents.controller.js';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [
    DocumentsController,
    TeacherDocumentsController,
    TeacherDocumentCategoriesController,
    TeacherClassMaterialsController,
    StudentMaterialsController,
  ],
  providers: [DocumentsService, ClassMaterialsService],
  exports: [DocumentsService, ClassMaterialsService],
})
export class DocumentsModule {}
