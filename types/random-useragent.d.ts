declare module 'random-useragent' {
  export function getRandom(): string;
  export function getRandomData(): {
    folderName: string;
    description: string;
    userAgent: string;
  };
}
