import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
    selector: 'knowledge-base-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class KnowledgeBaseArticleComponent {
    /**
     * Constructor
     *
     * @param {MatDialogRef<KnowledgeBaseArticleComponent>} matDialogRef
     * @param _data
     */
    constructor(
        public matDialogRef: MatDialogRef<KnowledgeBaseArticleComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any
    ) {
    }
}
