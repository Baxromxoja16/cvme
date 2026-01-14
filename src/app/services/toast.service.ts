import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageService = inject(MessageService);

  success(detail: string, summary: string = 'Success') {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  error(detail: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  warning(detail: string, summary: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail });
  }
}
