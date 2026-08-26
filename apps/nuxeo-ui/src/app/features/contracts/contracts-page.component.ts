import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>Contracts Dashboard</h1>
      <div
        style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem;"
      >
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Active Contracts</h3>
          <p style="font-size: 2rem; margin: 1rem 0;">24</p>
          <p style="color: #666;">Updated 2 hours ago</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Expiring Soon</h3>
          <p style="font-size: 2rem; margin: 1rem 0; color: #f57c00;">3</p>
          <p style="color: #666;">Next 30 days</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Total Value</h3>
          <p style="font-size: 2rem; margin: 1rem 0;">$2.4M</p>
          <p style="color: #666;">Current quarter</p>
        </div>
      </div>
      <div style="margin-top: 2rem; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Recent Activity</h3>
        <ul>
          <li style="padding: 0.5rem 0;">Contract ABC-123 renewed - 2 days ago</li>
          <li style="padding: 0.5rem 0;">Contract XYZ-789 pending review - 3 days ago</li>
          <li style="padding: 0.5rem 0;">Contract DEF-456 signed - 1 week ago</li>
        </ul>
      </div>
    </div>
  `,
})
export class ContractsPageComponent {}
