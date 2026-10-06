
import { Directory, File, Paths } from 'expo-file-system';

function imagesDirectory() {
    return new Directory(Paths.document, 'plant-images');
}

// Copies a picked or captured photo into permanent storage.
// Returns the new permanent URI, or null when there is no photo.
export async function savePlantImage(sourceUri) {
    if (!sourceUri) {
        return null;
    }

    const directory = imagesDirectory();
    directory.create({ idempotent: true, intermediates: true });

    const source = new File(sourceUri);
    const extension = source.extension || '.jpg';
    // Time + random part, so two photos never get the same name
    const name = `plant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
    const destination = new File(directory, name);

    await source.copy(destination);
    return destination.uri;
}

// Removes a photo saved by savePlantImage. URIs outside the app's photo
// folder (e.g. old cache URIs) are left alone, so this never deletes files it
// doesn't own. Never throws: a leftover file is better than a crash.
export function deletePlantImage(uri) {
    if (!uri || !uri.startsWith(imagesDirectory().uri)) {
        return;
    }
    try {
        const file = new File(uri);
        if (file.exists) {
            file.delete();
        }
    } catch (error) {
        console.warn('Could not delete plant photo', uri, error);
    }
}
