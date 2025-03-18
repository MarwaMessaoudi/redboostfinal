// sub-folder.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule


@Component({
    selector: 'app-sub-folder',
    standalone: true, // make sure that this line is add

    templateUrl: './sub-folder.component.html',
    styleUrls: ['./sub-folder.component.css'],
    imports: [CommonModule], // Add CommonModule to the imports array

})
export class SubFolderComponent implements OnInit {

    folderName: string | null = null;
    folderMetadataId: number | null = null;
    categoryName: string | null = null;
    subFolderName: string | null = null;

    files: any[] = [
        { name: 'Document1.pdf', size: 1024 },
        { name: 'Image2.jpg', size: 2048 },
        { name: 'Presentation.pptx', size: 3072 }
    ];

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.folderName = params['folderName'];
            this.folderMetadataId = +params['folderMetadataId']; // Use + to convert to number
            this.categoryName = params['categoryName'];
            this.subFolderName = params['subFolderName'];

            // Now you have the parameters!  You can use them to fetch data, etc.
            console.log('FolderName:', this.folderName);
            console.log('FolderMetadataId:', this.folderMetadataId);
            console.log('CategoryName:', this.categoryName);
            console.log('SubFolderName:', this.subFolderName);

            // Call a function to load files based on the parameters
            this.loadFiles();
            
        });
    }
    onFileSelected(event: any) {
      const files: FileList = event.target.files;
      if (files.length > 0) {
        // Handle the selected files here
        console.log('Selected files:', files);
        // You can loop through the files and do something with them
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log('File name:', file.name);
          console.log('File size:', file.size);
        }
      }
    }

    loadFiles(): void {
        // Implement logic to fetch and display files related to this subfolder
        // You'll likely use a service to make an HTTP request to your backend.
    }
}
