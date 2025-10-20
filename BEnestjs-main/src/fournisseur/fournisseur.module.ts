import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FournisseurService } from './fournisseur.service';
import { FournisseurController } from './fournisseur.controller';
import { Fournisseur, FournisseurSchema } from './schemas/fournisseur.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Fournisseur.name, schema: FournisseurSchema }])],
  controllers: [FournisseurController],
  providers: [FournisseurService],
  exports: [FournisseurService],
})
export class FournisseurModule {}
