import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'app-athlete-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  templateUrl: './athlete-list.component.html',
  styleUrls: ['./athlete-list.component.css']
})
export class AthleteListComponent implements OnInit {
  athletes: any[] = [];
  filteredAthletes: any[] = [];
  searchTerm: string = '';
  isLoading = true;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // TODO: Get tenantId from auth service
    const tenantId = 'tenant1';
    this.isLoading = true;
    this.apiService.getAthletes(tenantId).subscribe({
      next: (athletes) => {
        this.athletes = athletes.map(a => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`,
          status: 'Active', // Default status for now
          lastWorkout: new Date(), // Placeholder
          avatar: `${a.firstName[0]}${a.lastName[0]}`
        }));
        this.filteredAthletes = this.athletes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load athletes', err);
        this.isLoading = false;
      }
    });
  }

  filterAthletes() {
    if (!this.searchTerm) {
      this.filteredAthletes = this.athletes;
    } else {
      this.filteredAthletes = this.athletes.filter(a =>
        a.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}
