import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
from datetime import datetime
from pathlib import Path

class ProjectManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Project Manager")
        self.root.geometry("900x700")
        
        # Path to projects.json
        self.json_path = Path("pestiantal-portfolio/src/data/projects.json")
        
        # Load existing projects
        self.projects = self.load_projects()
        
        # Track current project index
        self.current_project_index = None
        
        # Create UI
        self.create_ui()
        
        # Load first project if exists
        if self.projects:
            self.current_project_index = 0
            self.project_list.selection_set(0)
            self.load_project(0)
    
    def load_projects(self):
        """Load projects from JSON file"""
        if self.json_path.exists():
            with open(self.json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def save_projects(self):
        """Save projects to JSON file"""
        with open(self.json_path, 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, indent=2, ensure_ascii=False)
        messagebox.showinfo("Success", "Projects saved successfully!")
    
    def create_ui(self):
        """Create the main UI"""
        # Create main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        # Left panel - Project list
        left_frame = ttk.Frame(main_frame)
        left_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        ttk.Label(left_frame, text="Projects", font=('Arial', 12, 'bold')).pack(pady=(0, 5))
        
        # Project listbox with scrollbar
        list_frame = ttk.Frame(left_frame)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.project_list = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, width=30, exportselection=False)
        self.project_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.project_list.yview)
        
        # Populate list
        for project in self.projects:
            self.project_list.insert(tk.END, f"{project['name']} (v{project['version']})")
        
        self.project_list.bind('<<ListboxSelect>>', self.on_project_select)
        
        # Buttons for list operations
        btn_frame = ttk.Frame(left_frame)
        btn_frame.pack(pady=(10, 0))
        
        ttk.Button(btn_frame, text="New", command=self.new_project).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="Delete", command=self.delete_project).pack(side=tk.LEFT, padx=2)
        
        # Right panel - Project editor
        right_frame = ttk.Frame(main_frame)
        right_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create scrollable canvas for form
        canvas = tk.Canvas(right_frame)
        scrollbar = ttk.Scrollbar(right_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Form fields
        row = 0
        
        # ID
        ttk.Label(scrollable_frame, text="Project ID:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.id_var = tk.StringVar()
        ttk.Entry(scrollable_frame, textvariable=self.id_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Name
        ttk.Label(scrollable_frame, text="Name:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar()
        ttk.Entry(scrollable_frame, textvariable=self.name_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Version
        ttk.Label(scrollable_frame, text="Version:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.version_var = tk.StringVar()
        ttk.Entry(scrollable_frame, textvariable=self.version_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Short Description
        ttk.Label(scrollable_frame, text="Short Description:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.short_desc_text = tk.Text(scrollable_frame, height=3, width=40)
        self.short_desc_text.grid(row=row, column=1, pady=5)
        row += 1
        
        # Full Description
        ttk.Label(scrollable_frame, text="Full Description:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.full_desc_text = tk.Text(scrollable_frame, height=5, width=40)
        self.full_desc_text.grid(row=row, column=1, pady=5)
        row += 1
        
        # Icon Path
        ttk.Label(scrollable_frame, text="Icon Path:").grid(row=row, column=0, sticky=tk.W, pady=5)
        icon_frame = ttk.Frame(scrollable_frame)
        icon_frame.grid(row=row, column=1, pady=5)
        self.icon_var = tk.StringVar()
        ttk.Entry(icon_frame, textvariable=self.icon_var, width=35).pack(side=tk.LEFT)
        ttk.Button(icon_frame, text="📁", command=lambda: self.browse_file(self.icon_var), width=3).pack(side=tk.LEFT, padx=(5, 0))
        row += 1
        
        # Images
        ttk.Label(scrollable_frame, text="Screenshots:").grid(row=row, column=0, sticky=tk.W, pady=5)
        images_frame = ttk.Frame(scrollable_frame)
        images_frame.grid(row=row, column=1, pady=5)
        
        self.images_list = tk.Listbox(images_frame, height=4, width=35, exportselection=False)
        self.images_list.pack(side=tk.LEFT)
        
        img_btn_frame = ttk.Frame(images_frame)
        img_btn_frame.pack(side=tk.LEFT, padx=(5, 0))
        ttk.Button(img_btn_frame, text="Add", command=self.add_image).pack(pady=2)
        ttk.Button(img_btn_frame, text="Remove", command=self.remove_image).pack(pady=2)
        row += 1
        
        # Tech Stack
        ttk.Label(scrollable_frame, text="Tech Stack:").grid(row=row, column=0, sticky=tk.W, pady=5)
        stack_frame = ttk.Frame(scrollable_frame)
        stack_frame.grid(row=row, column=1, pady=5)
        
        self.stack_list = tk.Listbox(stack_frame, height=4, width=35, exportselection=False)
        self.stack_list.pack(side=tk.LEFT)
        
        stack_btn_frame = ttk.Frame(stack_frame)
        stack_btn_frame.pack(side=tk.LEFT, padx=(5, 0))
        ttk.Button(stack_btn_frame, text="Add", command=self.add_tech).pack(pady=2)
        ttk.Button(stack_btn_frame, text="Remove", command=self.remove_tech).pack(pady=2)
        row += 1
        
        # GitHub URL
        ttk.Label(scrollable_frame, text="GitHub URL:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.github_var = tk.StringVar()
        ttk.Entry(scrollable_frame, textvariable=self.github_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Live URL
        ttk.Label(scrollable_frame, text="Live URL:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.live_var = tk.StringVar()
        ttk.Entry(scrollable_frame, textvariable=self.live_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Save button
        ttk.Button(scrollable_frame, text="Save Changes", command=self.save_current_project).grid(row=row, column=0, columnspan=2, pady=20)
        
        # Bottom save all button
        ttk.Button(main_frame, text="Save All to JSON", command=self.save_projects, style='Accent.TButton').grid(row=1, column=0, columnspan=2, pady=10)
    
    def on_project_select(self, event):
        """Handle project selection from list"""
        selection = self.project_list.curselection()
        if selection:
            self.current_project_index = selection[0]
            self.load_project(self.current_project_index)
    
    def load_project(self, index):
        """Load project data into form"""
        if 0 <= index < len(self.projects):
            project = self.projects[index]
            self.current_project_index = index
            
            self.id_var.set(project.get('id', ''))
            self.name_var.set(project.get('name', ''))
            self.version_var.set(project.get('version', ''))
            
            self.short_desc_text.delete('1.0', tk.END)
            self.short_desc_text.insert('1.0', project.get('shortDescription', ''))
            
            self.full_desc_text.delete('1.0', tk.END)
            self.full_desc_text.insert('1.0', project.get('fullDescription', ''))
            
            self.icon_var.set(project.get('icon', ''))
            
            # Load images
            self.images_list.delete(0, tk.END)
            for img in project.get('images', []):
                self.images_list.insert(tk.END, img)
            
            # Load stack
            self.stack_list.delete(0, tk.END)
            for tech in project.get('stack', []):
                self.stack_list.insert(tk.END, f"{tech['name']} ({tech['icon']})")
            
            self.github_var.set(project.get('githubUrl', ''))
            self.live_var.set(project.get('liveUrl', ''))
            
            # Ensure selection is maintained
            self.project_list.selection_clear(0, tk.END)
            self.project_list.selection_set(index)
    
    def save_current_project(self):
        """Save current form data to project"""
        if self.current_project_index is None:
            messagebox.showwarning("Warning", "Please select a project first")
            return
        
        index = self.current_project_index
        
        # Collect images
        images = []
        for i in range(self.images_list.size()):
            images.append(self.images_list.get(i))
        
        # Collect stack
        stack = []
        for i in range(self.stack_list.size()):
            item = self.stack_list.get(i)
            # Parse "Name (icon)" format
            parts = item.rsplit(' (', 1)
            if len(parts) == 2:
                name = parts[0]
                icon = parts[1].rstrip(')')
                stack.append({"name": name, "icon": icon})
        
        # Update project
        self.projects[index] = {
            "id": self.id_var.get(),
            "name": self.name_var.get(),
            "version": self.version_var.get(),
            "shortDescription": self.short_desc_text.get('1.0', tk.END).strip(),
            "fullDescription": self.full_desc_text.get('1.0', tk.END).strip(),
            "icon": self.icon_var.get(),
            "images": images,
            "stack": stack,
            "githubUrl": self.github_var.get(),
            "liveUrl": self.live_var.get(),
            "createdAt": self.projects[index].get('createdAt', datetime.now().isoformat()),
            "updatedAt": datetime.now().isoformat()
        }
        
        # Update list
        self.project_list.delete(index)
        self.project_list.insert(index, f"{self.name_var.get()} (v{self.version_var.get()})")
        self.project_list.selection_set(index)
        self.current_project_index = index
        
        messagebox.showinfo("Success", "Project updated!")
    
    def new_project(self):
        """Create new project"""
        new_project = {
            "id": "new-project",
            "name": "New Project",
            "version": "0.1.0",
            "shortDescription": "",
            "fullDescription": "",
            "icon": "",
            "images": [],
            "stack": [],
            "githubUrl": "",
            "liveUrl": "",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        self.projects.append(new_project)
        self.project_list.insert(tk.END, f"{new_project['name']} (v{new_project['version']})")
        self.current_project_index = len(self.projects) - 1
        self.project_list.selection_clear(0, tk.END)
        self.project_list.selection_set(self.current_project_index)
        self.load_project(self.current_project_index)
    
    def delete_project(self):
        """Delete selected project"""
        if self.current_project_index is None:
            messagebox.showwarning("Warning", "Please select a project first")
            return
        
        if messagebox.askyesno("Confirm", "Delete this project?"):
            index = self.current_project_index
            del self.projects[index]
            self.project_list.delete(index)
            
            if self.projects:
                new_index = min(index, len(self.projects) - 1)
                self.current_project_index = new_index
                self.project_list.selection_set(new_index)
                self.load_project(new_index)
            else:
                self.current_project_index = None
    
    def browse_file(self, var):
        """Browse for file and convert to web path"""
        filename = filedialog.askopenfilename(
            title="Select Image",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.gif"), ("All Files", "*.*")]
        )
        if filename:
            # Convert to relative web path
            filepath = Path(filename)
            
            # Check if it's in the public directory
            try:
                public_path = Path("pestiantal-portfolio/public")
                if public_path.exists():
                    rel_path = filepath.relative_to(public_path.resolve())
                    web_path = f"/{rel_path.as_posix()}"
                else:
                    web_path = f"/{filepath.name}"
            except ValueError:
                # Not in public directory, just use filename
                web_path = f"/images/projects/{filepath.name}"
            
            var.set(web_path)
    
    def add_image(self):
        """Add image to list"""
        filename = filedialog.askopenfilename(
            title="Select Screenshot",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.gif"), ("All Files", "*.*")]
        )
        if filename:
            filepath = Path(filename)
            
            # Convert to web path
            try:
                public_path = Path("pestiantal-portfolio/public")
                if public_path.exists():
                    rel_path = filepath.relative_to(public_path.resolve())
                    web_path = f"/{rel_path.as_posix()}"
                else:
                    web_path = f"/{filepath.name}"
            except ValueError:
                web_path = f"/images/projects/{filepath.name}"
            
            self.images_list.insert(tk.END, web_path)
    
    def remove_image(self):
        """Remove selected image"""
        selection = self.images_list.curselection()
        if selection:
            self.images_list.delete(selection[0])
    
    def add_tech(self):
        """Add tech to stack"""
        dialog = TechDialog(self.root)
        if dialog.result:
            self.stack_list.insert(tk.END, f"{dialog.result['name']} ({dialog.result['icon']})")
    
    def remove_tech(self):
        """Remove selected tech"""
        selection = self.stack_list.curselection()
        if selection:
            self.stack_list.delete(selection[0])

class TechDialog(tk.Toplevel):
    """Dialog for adding tech stack item"""
    def __init__(self, parent):
        super().__init__(parent)
        self.result = None
        
        self.title("Add Technology")
        self.geometry("400x150")
        
        # Common tech icons
        common_icons = [
            "typescript", "javascript", "python", "java", "kotlin", "swift",
            "react", "nextdotjs", "nodejs", "vite", "tailwindcss",
            "postgresql", "mysql", "mongodb", "redis",
            "docker", "kubernetes", "git", "github",
            "amazonwebservices", "digitalocean", "vercel",
            "godotengine", "unity", "unrealengine"
        ]
        
        ttk.Label(self, text="Tech Name:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        self.name_var = tk.StringVar()
        ttk.Entry(self, textvariable=self.name_var, width=30).grid(row=0, column=1, padx=10, pady=10)
        
        ttk.Label(self, text="Icon Name:").grid(row=1, column=0, padx=10, pady=10, sticky=tk.W)
        self.icon_var = tk.StringVar()
        icon_combo = ttk.Combobox(self, textvariable=self.icon_var, values=common_icons, width=27)
        icon_combo.grid(row=1, column=1, padx=10, pady=10)
        
        btn_frame = ttk.Frame(self)
        btn_frame.grid(row=2, column=0, columnspan=2, pady=10)
        
        ttk.Button(btn_frame, text="Add", command=self.on_ok).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.destroy).pack(side=tk.LEFT, padx=5)
        
        self.wait_window()
    
    def on_ok(self):
        if self.name_var.get() and self.icon_var.get():
            self.result = {
                "name": self.name_var.get(),
                "icon": self.icon_var.get()
            }
            self.destroy()
        else:
            messagebox.showwarning("Warning", "Please fill in both fields")

if __name__ == "__main__":
    root = tk.Tk()
    app = ProjectManager(root)
    root.mainloop()