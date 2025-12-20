import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxIcon } from 'ngx-icons-extra';

interface CollectionDetails {
  name: string;
  total: number;
  version: string;
  author: {
    name: string;
    url: string;
  };
  license: {
    title: string;
    spdx: string;
    url: string;
  };
  samples: string[];
  height: number;
  displayHeight: number;
  category: string;
  palette: boolean;
}

type CollectionsResponse = Record<string, CollectionDetails>;


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxIcon],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('demo');
  readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.http.get<CollectionsResponse>('https://api.iconify.design/collections').subscribe((res) => {
      const collectionIds = Object.keys(res);
      console.log(collectionIds);
    });
    
  }
}
