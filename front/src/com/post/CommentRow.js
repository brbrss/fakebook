
import { DateSpan } from '../sub/DateSpan';

export default function CommentRow(props) {

    return (
        <div className='comment'>
            <div>
                <span>{props.data.name}</span>
                <DateSpan date={props.data.date} />
            </div>
            <div>
                {props.data.content}
            </div>

        </div>
    );
}


