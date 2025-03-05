import { Component } from '@angular/core';
import { CameraService } from '../camera/services/camera.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-galeria',
  imports: [NgIf, NgFor],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent {
  images: string[] = [];

  constructor(private cameraService: CameraService) { }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.images = this.cameraService.getCapturedImages();
  }

  // método para eliminar una imagen**
  deleteImage(imageUrl: string): void {
    this.cameraService.deleteImage(imageUrl);
    this.loadImages(); // Recargar las imágenes tras eliminar
  }
}

