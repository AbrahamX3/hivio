using extension auth;

module default {
    scalar type TitleType extending enum<MOVIE, SERIES>;
    scalar type TitleStatus extending enum<PENDING, WATCHING, UNFINISHED, FINISHED>;
    
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
        multi hive := .<addedBy[is Hive];
        multi followers := .<followed[is Follow];
        multi following := .<follower[is Follow];
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

        index on (.username);
    }

    type Follow {
        required follower: User {
            on target delete delete source;
        };
        required followed: User {
            on target delete delete source;
        };
        required createdAt: datetime {
            default := datetime_current();
        }

        constraint exclusive on ( (.follower, .followed) );
    }

    type Season {
        required title: Title {
            on target delete delete source;
        };
        required season: int32;
        required episodes: int32;
        required air_date: cal::local_date;
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
        required release_date: cal::local_date;
        required type: TitleType;
        imdbId: str;
        description: str;
        rating: float32;
        poster: str;
        posterBlur: str;
        runtime: int32;
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

        index on (.tmdbId);
        index on (.type);
    }

    type Hive {
        required addedBy: User {
            on target delete delete source;
        };
        required title: Title {
            on target delete delete source;
        };
        required status: TitleStatus;
        required isFavorite: bool {
            default := false;
        }
        currentSeason: int32;
        currentEpisode: int32;
        rating: float32;
        finishedAt: datetime;
        startedAt: datetime;
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }

        constraint exclusive on ( (.title, .addedBy) );

        index on (.status);
    }
};