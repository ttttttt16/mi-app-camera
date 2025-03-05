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

    // Método para eliminar una imagen
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

    // Método para detectar si Capacitor funciona correctamente
    private isCapacitorCameraAvailable(): boolean {
        return !!navigator.userAgent.match(/(android|iphone|ipad|ipod|windows phone)/i);
    }

    // Método para tomar una foto con Capacitor o con <input type="file">
    async takePicture(): Promise<string> {
        if (!this.isCapacitorCameraAvailable()) {
            console.warn('Capacitor Camera no disponible, usando input de archivo.');
            return this.captureWithFileInput();
        }

        try {
            // Intentar capturar la imagen con Capacitor
            await this.checkPermissions();
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
            });

            if (image.webPath) {
                this.capturedImages.push(image.webPath); // Almacenar la URL
                this.saveImagesToStorage(); // Guardar en LocalStorage
                return image.webPath;
            }
        } catch (error) {
            console.warn('Error al capturar con Capacitor, usando input de archivo:', error);
            return this.captureWithFileInput();
        }

        return '';
    }

    // Método alternativo para capturar imagen con un input file (para navegadores)
    private captureWithFileInput(): Promise<string> {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment'; // Usa la cámara trasera del celular

            input.onchange = (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    const reader = new FileReader();

                    reader.onload = () => {
                        const imageUrl = reader.result as string;
                        this.capturedImages.push(imageUrl); // Guardar la imagen
                        this.saveImagesToStorage(); // Guardar en LocalStorage
                        resolve(imageUrl);
                    };

                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                } else {
                    reject('No se seleccionó ninguna imagen');
                }
            };

            input.click(); // Abre la cámara o el selector de archivos
        });
    }

    // Método para obtener las imágenes capturadas
    getCapturedImages(): string[] {
        return this.capturedImages;
    }
}
