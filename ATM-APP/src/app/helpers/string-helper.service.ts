import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root"
})
export class StringHelperService {
  constructor(private _snackBar: MatSnackBar) {}

  camelize = (str: string) => {
    return str
      .replace(/(?:^\w|\[A-Z\]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  addLeadingZeros(num: number, totalLength: number): string {
    return String(num).padStart(totalLength, "0");
  }

  toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
