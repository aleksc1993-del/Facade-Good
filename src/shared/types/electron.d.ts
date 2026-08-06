export {};
declare global { interface Window { facadeGood?: { printToPdf: (html: string, fileName: string) => Promise<boolean>; selectBackupFolder: () => Promise<string | null>; selectBackupFile: () => Promise<string | null>; writeBackupFile: (folderPath: string, fileName: string, content: string) => Promise<string> } } }
