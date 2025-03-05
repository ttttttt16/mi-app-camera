import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
@Injectable({
    providedIn: 'root'
})
export class CameraService {
    private capturedImages: string[] = []; // Array para almacenar las imágenes capturadas
    private readonly STORAGE_KEY = 'captured_images'; // Clave para LocalStorage


    constructor() {
        this.loadImagesFromStorage(); // Cargar imágenes al iniciar el servicio
    }

    // Método para cargar imágenes desde LocalStorage
    private loadImagesFromStorage(): void {
        const storedImages = localStorage.getItem(this.STORAGE_KEY);
        if (storedImages) {
            this.capturedImages = JSON.parse(storedImages);
        }
    }

    // Método para guardar imágenes en LocalStorage
    private saveImagesToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.capturedImages));
    }

    // método para eliminar una imagen**
    deleteImage(imageUrl: string): void {
        this.capturedImages = this.capturedImages.filter(img => img !== imageUrl);
        this.saveImagesToStorage(); // Actualizar LocalStorage
    }

    private async checkPermissions(): Promise<void> {
        const check = async (permission: PermissionStatus): Promise<boolean> => {
            if (permission.camera !== 'granted' || permission.photos !== 'granted') {
                const request = await Camera.requestPermissions();
                return request.camera === 'granted' && request.photos === 'granted';
            }
            return true;
        };

        const permissions = await Camera.checkPermissions();
        if (!(await check(permissions))) {
            throw new Error('Permisos de cámara no otorgados');
        }
    }


    // Método para tomar una foto
    async takePicture(): Promise<string> {
        try {
            await this.checkPermissions(); // Verificar permisos antes de capturar
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
            });

            if (image.webPath) {
                this.capturedImages.push(image.webPath); // Almacenar la URL
                this.saveImagesToStorage(); // Guardar en LocalStorage
            }

            return image.webPath || '';
        } catch (error) {
            console.error('Error al capturar la imagen:', error);
            throw error;
        }
    }

    // Método para obtener las imágenes capturadas
    getCapturedImages(): string[] {
        return this.capturedImages;
    }
}
