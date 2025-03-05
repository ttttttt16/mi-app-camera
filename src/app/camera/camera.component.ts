import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from './services/camera.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent {
  cameraService: CameraService = inject(CameraService);
  imgUrl: string = ''; // URL de la imagen capturada
  errorMessage: string = ''; // Mensaje de error
  loading: boolean = false; // Estado de carga
  captureMessage: string = 'No hay imagen capturada'; // Mensaje de estado
  flashActive: boolean = false; // Estado del flash

  async takePicture() {
    this.errorMessage = '';
    this.loading = true;
    this.flashActive = true;

    try {
      this.imgUrl = await this.cameraService.takePicture();
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      this.captureMessage = 'Imagen tomada con éxito';
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      this.errorMessage = String(error);
      this.imgUrl = '';
      this.captureMessage = 'No hay imagen capturada';
    } finally {
      this.loading = false;
      setTimeout(() => this.flashActive = false, 300);
    }
  }
}