import { CastVoteValidationPolicy } from '../../../../src/domain/policies/cast-vote/cast-vote-validation.policy';
import { CastVoteValidationException } from '../../../../src/domain/exceptions/cast-vote/cast-vote.exception';
import { BALLOT_STATUS_CONSTANTS } from '../../../../src/shared/constants/ballot.constants';
import { ELECTION_STATUS_CONSTANTS } from '../../../../src/shared/constants/election.constants';

describe('CastVotePolicy', () => {
  let policy: CastVoteValidationPolicy;

  beforeEach(() => {
    policy = new CastVoteValidationPolicy();
  });

  describe('validateElectionState', () => {
    it('should throw when election is null', () => {
      expect(() => policy.validateElectionState(null)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when election is not in STARTED state', () => {
      const election = {
        id: 1,
        status: ELECTION_STATUS_CONSTANTS.SCHEDULED,
      } as any;

      expect(() => policy.validateElectionState(election)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when election has ended', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const election = {
        id: 1,
        status: ELECTION_STATUS_CONSTANTS.STARTED,
        endTime: pastDate,
      } as any;

      expect(() => policy.validateElectionState(election)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should not throw for active election', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

      const election = {
        id: 1,
        status: ELECTION_STATUS_CONSTANTS.STARTED,
        endTime: futureDate,
      } as any;

      expect(() => policy.validateElectionState(election)).not.toThrow();
    });
  });

  describe('validateDelegateEligibility', () => {
    it('should throw when delegate is null', () => {
      expect(() => policy.validateDelegateEligibility(null)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when delegate has already voted', () => {
      const delegate = {
        id: 1,
        hasVoted: true,
      } as any;

      expect(() => policy.validateDelegateEligibility(delegate)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should not throw for eligible delegate', () => {
      const delegate = {
        id: 1,
        hasVoted: false,
      } as any;

      expect(() => policy.validateDelegateEligibility(delegate)).not.toThrow();
    });
  });

  describe('validateBallot', () => {
    it('should throw when ballot is null', () => {
      expect(() => policy.validateBallot(null)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when ballot is already submitted', () => {
      const ballot = {
        id: 1,
        status: BALLOT_STATUS_CONSTANTS.SUBMITTED,
      } as any;

      expect(() => policy.validateBallot(ballot)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should not throw for valid ballot', () => {
      const ballot = {
        id: 1,
        status: BALLOT_STATUS_CONSTANTS.ISSUED,
      } as any;

      expect(() => policy.validateBallot(ballot)).not.toThrow();
    });
  });

  describe('validateCandidate', () => {
    it('should throw when candidate is null', () => {
      expect(() => policy.validateCandidate(null, 1)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when candidate is from different election', () => {
      const candidate = {
        id: 1,
        electionId: 2,
      } as any;

      expect(() => policy.validateCandidate(candidate, 1)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should throw when candidate is deleted', () => {
      const candidate = {
        id: 1,
        electionId: 1,
        deletedAt: new Date(),
      } as any;

      expect(() => policy.validateCandidate(candidate, 1)).toThrow(
        CastVoteValidationException,
      );
    });

    it('should not throw for valid candidate', () => {
      const candidate = {
        id: 1,
        electionId: 1,
        deletedAt: null,
      } as any;

      expect(() => policy.validateCandidate(candidate, 1)).not.toThrow();
    });
  });

  describe('validatePositionLimits', () => {
    it('should throw when position is not found', () => {
      const candidatesPerPosition = new Map([[1, 1]]);
      const positions = new Map();

      expect(() =>
        policy.validatePositionLimits(candidatesPerPosition, positions),
      ).toThrow(CastVoteValidationException);
    });

    it('should throw when too many votes for a position', () => {
      const candidatesPerPosition = new Map([[1, 3]]);
      const positions = new Map([
        [
          1,
          {
            id: 1,
            desc1: 'President',
            maxCandidates: 2,
          } as any,
        ],
      ]);

      expect(() =>
        policy.validatePositionLimits(candidatesPerPosition, positions),
      ).toThrow(CastVoteValidationException);
    });

    it('should not throw when votes are within limits', () => {
      const candidatesPerPosition = new Map([[1, 2]]);
      const positions = new Map([
        [
          1,
          {
            id: 1,
            desc1: 'President',
            maxCandidates: 2,
          } as any,
        ],
      ]);

      expect(() =>
        policy.validatePositionLimits(candidatesPerPosition, positions),
      ).not.toThrow();
    });
  });

  describe('validateVotingOperation', () => {
    it('should allow when no candidates are selected', () => {
      const election = {
        id: 1,
        status: ELECTION_STATUS_CONSTANTS.STARTED,
      } as any;

      const delegate = {
        id: 1,
        hasVoted: false,
      } as any;

      const ballot = {
        id: 1,
        status: BALLOT_STATUS_CONSTANTS.ISSUED,
      } as any;

      const candidates = [];
      const positions = new Map();

      expect(() =>
        policy.validateVotingOperation(
          election,
          delegate,
          ballot,
          candidates,
          positions,
        ),
      ).not.toThrow();
    });

    it('should validate successfully with selected candidates', () => {
      const election = {
        id: 1,
        status: ELECTION_STATUS_CONSTANTS.STARTED,
      } as any;

      const delegate = {
        id: 1,
        hasVoted: false,
      } as any;

      const ballot = {
        id: 1,
        status: BALLOT_STATUS_CONSTANTS.ISSUED,
      } as any;

      const positions = new Map([
        [
          1,
          {
            id: 1,
            desc1: 'President',
            maxCandidates: 1,
          } as any,
        ],
      ]);

      const candidates = [
        {
          id: 1,
          electionId: 1,
          positionId: 1,
          deletedAt: null,
        } as any,
      ];

      expect(() =>
        policy.validateVotingOperation(
          election,
          delegate,
          ballot,
          candidates,
          positions,
        ),
      ).not.toThrow();
    });
  });
});
