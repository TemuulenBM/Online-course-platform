/** Санал өгсөн хэрэглэгчийн value object */
export class VoterVO {
  readonly userId: string;
  readonly voteType: 'up' | 'down';

  constructor(props: { userId: string; voteType: string }) {
    this.userId = props.userId;
    this.voteType = props.voteType as 'up' | 'down';
  }
}
