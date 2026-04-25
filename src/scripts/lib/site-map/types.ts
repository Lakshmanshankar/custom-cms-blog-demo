export type FolderChild = {
  id: string;
  isFolder: boolean;
  title?: string;
  icon?: string;
};

export type Folder = {
  id: string;
  siteId: string;
  title?: string;
  parentFolderId: string | null;
  children: FolderChild[];
  createdAt: unknown;
  updatedAt: unknown;
};

export type File = {
  id: string;
  siteId: string;
  title?: string;
  parentFolderId: string | null;
  storageFile: string;
  createdAt: unknown;
  updatedAt: unknown;
};

export type PageTreeFolderNode = {
  id: string;
  type: "folder";
  title: string;
  path: string;
  children: PageTreeNode[];
};

export type PageTreeFileNode = {
  id: string;
  type: "file";
  title: string;
  path: string;
  storageFile: string;
};

export type PageTreeNode = PageTreeFolderNode | PageTreeFileNode;

export type SitePages = {
  siteId: string;
  rootFolderId: string;
  pages: PageTreeNode[];
};

export type SiteTreeStore = {
  foldersById: Map<string, Folder>;
  filesById: Map<string, File>;
};
