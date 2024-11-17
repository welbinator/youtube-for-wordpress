import { registerBlockType } from '@wordpress/blocks';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import save from './save';

registerBlockType('yt-for-wp/youtube-live', {
    edit: Edit,
    save,
});
