import os

IGNORE_DIRS = {
    "venv", "node_modules", ".git", "__pycache__", "dist", "build", 
    "coverage", ".pytest_cache", ".vscode", ".idea", "migrations", "versions"
}

INCLUDE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".sql", ".ini", ".json"
}

IGNORE_FILES = {
    "package-lock.json", "yarn.lock", "context_maker.py", "TUM_PROJE_KODLARI.txt",
    "force_db.py", "nuke_db.py", "init_db.py", "README.md"
}

OUTPUT_FILE = "TUM_PROJE_KODLARI.txt"

def get_files_recursively(directory):
    file_paths = []
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if file in IGNORE_FILES:
                continue
                
            _, ext = os.path.splitext(file)
            if ext in INCLUDE_EXTENSIONS:
                file_paths.append(os.path.join(root, file))
    return file_paths

def merge_files():
    root_dir = os.getcwd()
    all_files = get_files_recursively(root_dir)
    
    print(f"Toplam {len(all_files)} dosya bulundu. Birleştiriliyor...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        outfile.write(f"# PROJE KOD DÖKÜMÜ\n")
        outfile.write(f"# Bu dosya tum projenin kodlarini icerir.\n\n")
        
        for file_path in all_files:
            rel_path = os.path.relpath(file_path, root_dir)
            outfile.write(f"\n{'='*50}\n")
            outfile.write(f"FILE PATH: {rel_path}\n")
            outfile.write(f"{'='*50}\n\n")
            
            try:
                with open(file_path, "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"!!! HATA: Dosya okunamadı: {e}\n")
                
            outfile.write("\n")
            
    print(f"✅ İşlem Tamam! '{OUTPUT_FILE}' dosyası oluşturuldu.")
    print("Bu dosyayı AI Studio'ya yükleyebilirsin.")

if __name__ == "__main__":
    merge_files()