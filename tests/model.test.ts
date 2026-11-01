import { describe,it,expect } from 'vitest';
import ExcelJS from 'exceljs';
import { validateImport,studentSchema,classSchema } from '../src/lib/model';
import { mappedRows,cellText,readWorkbook } from '../src/lib/excel';
import { seed } from '../src/lib/seed';
describe('student validation',()=>{
 it('requires name, internal ID and valid class',()=>{expect(studentSchema.safeParse({name:'',student_code:'',class_id:'bad'}).success).toBe(false);});
 it('rejects invalid school year levels',()=>expect(classSchema.safeParse({name:'X',year_level:7,academic_year_id:seed().academic_years[0].id}).success).toBe(false));
 it('detects duplicate IDs case-insensitively within a file',()=>{const rows=validateImport([{row:2,name:'Test One',student_code:'A'},{row:3,name:'Test Two',student_code:'a'}],[],'add');expect(rows[1].error).toBeTruthy();});
 it('rejects existing IDs in add mode and unknown IDs in update mode',()=>{expect(validateImport([{row:2,name:'New Name',student_code:'DEMO-1'}],seed().students,'add')[0].error).toBeTruthy();expect(validateImport([{row:2,name:'New Name',student_code:'missing'}],seed().students,'update')[0].error).toBeTruthy();});
 it('rejects blank updates instead of overwriting names',()=>expect(validateImport([{row:2,name:'',student_code:'DEMO-1'}],seed().students,'update')[0].error).toBeTruthy());
});
describe('Excel import',()=>{
 it('maps selected columns and skips empty rows',()=>{const w=new ExcelJS.Workbook();const s=w.addWorksheet('Murid');s.addRow(['ID','Nama']);s.addRow(['X','Nama Contoh']);s.addRow([]);expect(mappedRows(s,2,1)).toEqual([{row:2,name:'Nama Contoh',student_code:'X'}]);});
 it('reports an empty sheet',()=>{const w=new ExcelJS.Workbook();expect(mappedRows(w.addWorksheet('Empty'),2,1)).toEqual([]);});
 it('reads rich text and cached formula values',()=>{expect(cellText({richText:[{text:'A'},{text:'B'}]})).toBe('AB');expect(cellText({formula:'1+1',result:2})).toBe('2');});
 it('rejects malformed files',async()=>{const file={name:'bad.xlsx',size:4,arrayBuffer:async()=>new TextEncoder().encode('oops').buffer} as File;await expect(readWorkbook(file)).rejects.toThrow('Fail Excel');});
});
