import os
import zipfile

def create_project_zip(output_filename="public/sicurezza-xp-codigo-fuente.zip"):
    ignore_dirs = {
        'node_modules', 'dist', 'build', '.git', '.aistudio', '__pycache__'
    }
    ignore_files = {
        'sicurezza-xp-codigo-fuente.zip', 'sicurezza-xp-proyecto.zip', '.DS_Store'
    }

    print(f"Empaquetando proyecto en {output_filename}...")
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.git')]
            for file in files:
                if file in ignore_files or file.endswith('.zip') or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                archive_path = os.path.relpath(file_path, '.')
                if archive_path.startswith('./'):
                    archive_path = archive_path[2:]
                zipf.write(file_path, archive_path)
    
    size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"¡Éxito! Archivo creado: {output_filename} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    create_project_zip()
