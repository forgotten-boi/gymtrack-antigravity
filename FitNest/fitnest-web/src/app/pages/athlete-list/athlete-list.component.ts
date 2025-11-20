import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-athlete-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './athlete-list.component.html',
  styleUrls: ['./athlete-list.component.css']
})
export class AthleteListComponent implements OnInit {
  athletes: any[] = [];
  filteredAthletes: any[] = [];
  searchTerm: string = '';

  constructor() { }

  ngOnInit() {
    // Mock data
    this.athletes = [
      { id: '1', name: 'Sarah Conner', status: 'Active', lastWorkout: new Date(Date.now() - 86400000), avatar: 'SC' },
      { id: '2', name: 'John Doe', status: 'Active', lastWorkout: new Date(Date.now() - 172800000), avatar: 'JD' },
      { id: '3', name: 'Jane Smith', status: 'Inactive', lastWorkout: new Date(Date.now() - 604800000), avatar: 'JS' },
      { id: '4', name: 'Mike Tyson', status: 'Active', lastWorkout: new Date(), avatar: 'MT' }
    ];
    this.filteredAthletes = this.athletes;
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
