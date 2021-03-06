import { Allocation } from '@/api/server/getServer';
import { FractalResponseData } from '@/api/http';
import { FileObject } from '@/api/server/files/loadDirectory';
import v4 from 'uuid/v4';

export const rawDataToServerAllocation = (data: FractalResponseData): Allocation => ({
    id: data.attributes.id,
    ip: data.attributes.ip,
    alias: data.attributes.ip_alias,
    port: data.attributes.port,
    notes: data.attributes.notes,
    isDefault: data.attributes.is_default,
});

export const rawDataToFileObject = (data: FractalResponseData): FileObject => ({
    uuid: v4(),
    name: data.attributes.name,
    mode: data.attributes.mode,
    size: Number(data.attributes.size),
    isFile: data.attributes.is_file,
    isSymlink: data.attributes.is_symlink,
    isEditable: data.attributes.is_editable,
    mimetype: data.attributes.mimetype,
    createdAt: new Date(data.attributes.created_at),
    modifiedAt: new Date(data.attributes.modified_at),

    isArchiveType: function () {
        return this.isFile && [
            'application/vnd.rar', // .rar
            'application/x-rar-compressed', // .rar (2)
            'application/x-tar', // .tar
            'application/x-br', // .tar.br
            'application/x-bzip2', // .tar.bz2, .bz2
            'application/gzip', // .tar.gz, .gz
            'application/x-lzip', // .tar.lz4, .lz4 (not sure if this mime type is correct)
            'application/x-sz', // .tar.sz, .sz (not sure if this mime type is correct)
            'application/x-xz', // .tar.xz, .xz
            'application/zstd', // .tar.zst, .zst
            'application/zip', // .zip
        ].indexOf(this.mimetype) >= 0;
    },
});
