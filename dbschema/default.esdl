using extension auth;

module default {
    scalar type TitleType extending enum<MOVIE, SERIES>;
    scalar type TitleStatus extending enum<UPCOMING, PENDING, WATCHING, UNFINISHED, FINISHED>;
    
    global CurrentUser := (
        assert_single((
            select User
            filter .identity = global ext::auth::ClientTokenIdentity
        ))
    );

    type User {
        required identity: ext::auth::Identity {
            constraint exclusive;
        };
        required email: str {
            constraint exclusive;
        };
        multi followers: Follower;
        required name: str;
        required status: TitleStatus {
            default := "WATCHING";
        };
        username: str {
            constraint exclusive;
        };
        avatar: str;
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
    }

    type Follower {
        required follower: User {
            constraint exclusive;
        };
        required followed: User {
            constraint exclusive;
        };
        required createdAt: datetime {
            default := datetime_current();
        }
    }

    type Title {
        imdbId: str;
        required tmdbId: int32;
        required name: str;
        description: str;
        required date: cal::local_date;
        poster: str;
        posterBlur: str;
        type: TitleType;
        updated: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
        required createdAt: datetime {
            default := datetime_current();
        }
        required genres: array<int32>;
    }

    type Hive {
        required addedBy: User;
        required title: Title {
            constraint exclusive;
        };
        required status: TitleStatus;
        required isFavorite: bool {
            default := false;
        }
        rating: float32;
        finishedAt: datetime;
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
    }
};