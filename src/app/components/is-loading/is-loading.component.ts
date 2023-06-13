import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-is-loading',
  templateUrl: './is-loading.component.html',
  styleUrls: ['./is-loading.component.css']
})
export class IsLoadingComponent implements OnInit {
  @Input() loading: boolean = false;
  @Input() label: string = 'Loading...';
  constructor() { }

  ngOnInit(): void {
  }

}
