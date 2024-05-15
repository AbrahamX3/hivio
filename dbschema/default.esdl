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
        avatar: str;
        required identity: ext::auth::Identity {
            constraint exclusive;
        };
        required email: str {
            constraint exclusive;
        };
        username: str {
            constraint exclusive;
        };
        multi followers := .<follower[is Follower];
        required name: str;
        required status: TitleStatus {
            default := "WATCHING";
        };
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
    }

    type Follower {
        required follower: User;
        required followed: User;
        required createdAt: datetime {
            default := datetime_current();
        }

        constraint exclusive on ( (.follower, .followed) );
    }

    type Season {
        required title: Title;
        required season: int32;
        required episodes: int32;
        required date: cal::local_date;
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }

        constraint exclusive on ( (.title, .season) );
    }

    type Title {
        required tmdbId: int32;
        required name: str;
        required date: cal::local_date;
        required type: TitleType;
        imdbId: str;
        description: str;
        rating: float32;
        poster: str;
        posterBlur: str;
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
        required createdAt: datetime {
            default := datetime_current();
        }
        required genres: array<int32>;
        multi seasons := .<title[is Season];

        constraint exclusive on ( (.tmdbId, .type) );
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