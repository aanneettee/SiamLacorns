# ТЕХНИЧЕСКИЙ ДОЛГ


## 1 ПРИМЕРЫ

### 1.1 Нечитабельный код

- `LacornService.java:39`
```java
// Проверяем уникальность актёров перед сохранением
if (lacorn.getActors() != null && !lacorn.getActors().isEmpty()) {
	List<Actor> processedActors = lacorn.getActors().stream()
			.map(actor -> {
				// Проверяем, существует ли актёр с таким именем
				return actorRepository.findByName(actor.getName())
						.map(existingActor -> {
							// Если актёр уже существует, используем его
							// Обновляем данные, если нужно
							if (existingActor.getPhotoUrl() == null && actor.getPhotoUrl() != null) {
								existingActor.setPhotoUrl(actor.getPhotoUrl());
							}
							if (existingActor.getBiography() == null && actor.getBiography() != null) {
								existingActor.setBiography(actor.getBiography());
							}
							return existingActor;
						})
						.orElseGet(() -> {
							// Если актёра нет, создаём нового
							return actorRepository.save(actor);
						});
			})
			.collect(Collectors.toList());

	lacorn.setActors(processedActors);
}
```

### 1.2 Дублирующийся код

- `UserService.java:52` и `UserService.java:301`
```java
// Конвертируем User в UserDTO с ВСЕМИ полями
UserDTO userDTO = new UserDTO();
userDTO.setId(user.getId());
userDTO.setUsername(user.getUsername());
userDTO.setEmail(user.getEmail());
userDTO.setRole(user.getRole());
userDTO.setBirthDate(user.getBirthDate());
userDTO.setAvatar(user.getAvatar());
```
---
```java
UserDTO userDTO = new UserDTO(
		user.getId(),
		user.getUsername(),
		user.getEmail(),
		user.getRole()
);
userDTO.setBirthDate(user.getBirthDate());
userDTO.setAvatar(user.getAvatar());
```

### 1.3 Отсутствие автоматизации (тесты/сборки/кодоген)

- `TMDBIntegrationService.java:300` - следует заменить `@lombok.Setter` и `@lombok.Getter` на уровне класса
```java
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }
public String getMedia_type() { return media_type; }
public void setMedia_type(String media_type) { this.media_type = media_type; }
public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }
public String getName() { return name; }
public void setName(String name) { this.name = name; }
public String getRelease_date() { return release_date; }
public void setRelease_date(String release_date) { this.release_date = release_date; }
public String getFirst_air_date() { return first_air_date; }
public void setFirst_air_date(String first_air_date) { this.first_air_date = first_air_date; }
public String getPoster_path() { return poster_path; }
public void setPoster_path(String poster_path) { this.poster_path = poster_path; }
public Double getVote_average() { return vote_average; }
public void setVote_average(Double vote_average) { this.vote_average = vote_average; }

```

- `TMDBIntegrationService.java:337` - тоже самое
```java
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }
public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }
public String getName() { return name; }
public void setName(String name) { this.name = name; }
public String getOverview() { return overview; }
public void setOverview(String overview) { this.overview = overview; }
public String getRelease_date() { return release_date; }
public void setRelease_date(String release_date) { this.release_date = release_date; }
public String getFirst_air_date() { return first_air_date; }
public void setFirst_air_date(String first_air_date) { this.first_air_date = first_air_date; }
public Integer getRuntime() { return runtime; }
public void setRuntime(Integer runtime) { this.runtime = runtime; }
public List<Integer> getEpisode_run_time() { return episode_run_time; }
public void setEpisode_run_time(List<Integer> episode_run_time) { this.episode_run_time = episode_run_time; }
public Integer getNumber_of_episodes() { return number_of_episodes; }
public void setNumber_of_episodes(Integer number_of_episodes) { this.number_of_episodes = number_of_episodes; }
public String getPoster_path() { return poster_path; }
public void setPoster_path(String poster_path) { this.poster_path = poster_path; }
public Double getVote_average() { return vote_average; }
public void setVote_average(Double vote_average) { this.vote_average = vote_average; }
public String getStatus() { return status; }
public void setStatus(String status) { this.status = status; }
public Boolean getAdult() { return adult; }
public void setAdult(Boolean adult) { this.adult = adult; }
public TMDBGenre[] getGenres() { return genres; }
public void setGenres(TMDBGenre[] genres) { this.genres = genres; }
public TMDBVideoResults getVideos() { return videos; }
public void setVideos(TMDBVideoResults videos) { this.videos = videos; }
public TMDBProductionCountry[] getProduction_countries() { return production_countries; }
public void setProduction_countries(TMDBProductionCountry[] production_countries) { this.production_countries = production_countries; }
public TMDBCredits getCredits() { return credits; }
public void setCredits(TMDBCredits credits) { this.credits = credits; }

```

- `Episode.java:57` - тоже самое
```java
// Геттеры и сеттеры
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }

public Integer getEpisodeNumber() { return episodeNumber; }
public void setEpisodeNumber(Integer episodeNumber) { this.episodeNumber = episodeNumber; }

public Integer getSeasonNumber() { return seasonNumber; }
public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }

public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }

public Integer getDuration() { return duration; }
public void setDuration(Integer duration) { this.duration = duration; }

public String getVideoUrl() { return videoUrl; }
public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

public String getThumbnailUrl() { return thumbnailUrl; }
public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

public Lacorn getLacorn() { return lacorn; }
public void setLacorn(Lacorn lacorn) { this.lacorn = lacorn; }

public LocalDateTime getCreatedAt() { return createdAt; }
public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

public List<VoiceoverType> getAvailableVoiceovers() { return availableVoiceovers; }
public void setAvailableVoiceovers(List<VoiceoverType> availableVoiceovers) {
	this.availableVoiceovers = availableVoiceovers;
}
```

- `User.java:52` - тоже самое
```java
// Геттеры и сеттеры
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getUsername() { return username; }
public void setUsername(String username) { this.username = username; }

public String getPassword() { return password; }
public void setPassword(String password) { this.password = password; }

public String getAvatar() { return avatar; }
public void setAvatar(String avatar) { this.avatar = avatar; }

public LocalDate getBirthDate() { return birthDate; }
public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

public String getEmail() { return email; }
public void setEmail(String email) { this.email = email; }

public String getRole() { return role; }
public void setRole(String role) { this.role = role; }

public List<SeriesCollection> getCollections() { return collections; }
public void setCollections(List<SeriesCollection> collections) { this.collections = collections; }
```

- `SeriesCollection.java:42` - следует заменить `@lombok.Setter` и `@lombok.Getter` на уровне класса, оставив один нешаблонный метод
```java
public Long getId() {
	return id;
}

public List<Long> getSeriesIds() {
	if (lacorns == null) {
		return new ArrayList<>();
	}
	try {
		return lacorns.stream()
				.map(Lacorn::getId)
				.collect(Collectors.toList());
	} catch (LazyInitializationException e) {
		return new ArrayList<>();
	}
}

public void setId(Long id) {
	this.id = id;
}

public String getName() {
	return name;
}

public void setName(String name) {
	this.name = name;
}

public User getUser() {
	return user;
}

public void setUser(User user) {
	this.user = user;
}

public List<Lacorn> getLacorns() {
	return lacorns;
}

public void setLacorns(List<Lacorn> lacorns) {
	this.lacorns = lacorns;
}
```

- `UserWatchHistory.java:50`
```java
// Геттеры и сеттеры
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public User getUser() { return user; }
public void setUser(User user) { this.user = user; }

public Lacorn getLacorn() { return lacorn; }
public void setLacorn(Lacorn lacorn) { this.lacorn = lacorn; }

public Episode getEpisode() { return episode; }  // Изменено с getCurrentEpisode
public void setEpisode(Episode episode) { this.episode = episode; }

public Integer getCurrentTime() { return currentTime; }
public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }

public Boolean isCompleted() { return completed; }  // Изменено с getIsCompleted
public void setCompleted(Boolean completed) { this.completed = completed; }

public LocalDateTime getLastWatched() { return lastWatched; }
public void setLastWatched(LocalDateTime lastWatched) {
	this.lastWatched = lastWatched;
}
public LocalDateTime getCreatedAt() { return createdAt; }
public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
```

- `TMDBLacornDTO.java`
```java
// Геттеры и сеттеры
public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }
public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }
public Integer getReleaseYear() { return releaseYear; }
public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }
public Integer getTotalEpisodes() { return totalEpisodes; }
public void setTotalEpisodes(Integer totalEpisodes) { this.totalEpisodes = totalEpisodes; }
public Integer getEpisodeDuration() { return episodeDuration; }
public void setEpisodeDuration(Integer episodeDuration) { this.episodeDuration = episodeDuration; }
public String getPosterUrl() { return posterUrl; }
public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
public String getTrailerUrl() { return trailerUrl; }
public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
public List<String> getGenres() { return genres; }
public void setGenres(List<String> genres) { this.genres = genres; }
public String getAgeRating() { return ageRating; }
public void setAgeRating(String ageRating) { this.ageRating = ageRating; }
public Double getRating() { return rating; }
public void setRating(Double rating) { this.rating = rating; }
public String getStatus() { return status; }
public void setStatus(String status) { this.status = status; }
public List<String> getAvailableVoiceovers() { return availableVoiceovers; }
public void setAvailableVoiceovers(List<String> availableVoiceovers) { this.availableVoiceovers = availableVoiceovers; }
public Long getTmdbId() { return tmdbId; }
public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
public String getMediaType() { return mediaType; }
public void setMediaType(String mediaType) { this.mediaType = mediaType; }
public List<String> getProductionCountries() { return productionCountries; }
public void setProductionCountries(List<String> productionCountries) { this.productionCountries = productionCountries; }
public List<ActorDTO> getActors() { return actors; }
public void setActors(List<ActorDTO> actors) { this.actors = actors; }
```

- Анаголичные ситуации в других моделях и DTO

### 1.4 Запутанная архитектура / Ненужные зависимости

- Классы `AccessDeniedException`, `AuthenticationException`, `ResourceNotFountException`, `ValidationException` наследуются от `CustomException`, что не имеет смысла

- Неконсистентная авторизация - использование `@AuthenticationPrincipal` в одних местах и `@RequestHeader(value = "X-User-Id", required = false)` в других

### 1.5 Медленные/неэффективные средства

- `UserController.java:143` - использование захардкоженого пути для сохранения аватарок пользователей - неэффективно, потенциально небезопасно и просто не будет работать в продакшене
```java
// Папка для сохранения аватаров (для runtime)
String uploadDir = "target/classes/static/uploads/avatars";
java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir).toAbsolutePath();

if (!java.nio.file.Files.exists(uploadPath)) {
	java.nio.file.Files.createDirectories(uploadPath);
}

// Создаём уникальное имя файла
String originalFilename = file.getOriginalFilename();
String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
String newFileName = username + "_" + System.currentTimeMillis() + fileExtension;

java.nio.file.Path filePath = uploadPath.resolve(newFileName);
file.transferTo(filePath.toFile());

// Формируем полный URL для фронтенда
String avatarUrl = "http://localhost:8081/uploads/avatars/" + newFileName;
logger.debug("Avatar saved at: {}, URL: {}", filePath, avatarUrl);
userService.updateAvatar(username, avatarUrl);
```

- `CorsConfig.java:12` и `SecurityConfig.java:87` - скорее всего не имеет смысла для локального деплоя, и не будет работать в продакшене
```java
registry.addMapping("/api/**")
		.allowedOrigins("http://localhost:3001") // разрешаем фронтенд
		.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
		.allowedHeaders("*")
		.allowCredentials(true)
		.maxAge(3600);
```
---
```java
configuration.setAllowedOrigins(Arrays.asList(
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001"
));
```

### 1.6 Незакоммиченый код / долгоживущие ветки

- Была удалена ветка `actor-details-page`, оставшаяся в репозитории после первого спринта (хотя и была закоммичена в `main`)

### 1.7 Отсутствие/несоответствие технической документации

- `ActorDTO.java:43` - вместо извлечения из базы данных, рост актеров генерируется случайно от хеша имени. Это должно было быть для теста до добавления в базу данных, но было благополучно забыто.
```java
private static double seededRandom(long seed) {
	seed = Math.abs(seed);
	if (seed == 0) seed = 1;
	return (((seed * 16807) % 2147483647) - 1) / 2147483646.0;
}

private static double normalRandom(long seedVal, double median, double stdDev) {
	double u1 = seededRandom(seedVal);
	double u2 = seededRandom(seedVal);
	double z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	return median + z0 * stdDev;
}

// TODO this is temporary before we'll add a height into the database
public static int genHeight(String actorName) {
	return (int) Math.floor(normalRandom(actorName.hashCode(), 180, 8));
}
```

### 1.8 Отсутствие тестовой среды

- Все тестирование проводится вручную, развертывая бек и фронт локально, что не является допустимым для серьезного проекта

### 1.9 Отсутствие непрерывной интеграции

- Развертывание не проводится, что может привести к проблемам при релизе, когда часть кода создана для локального использования и не работает в продакшене


## 2 ПЛАН УСТРАНЕНИЯ

1. Для устранения долгоживущих веток необходимо проверить, были ли они закоммичены в `main`, и `git push -d origin` их (не считая удаления локальных копий веток у участников проекта)
2. Для устранения проблем с нечитабельностью кода. дублированием кода необходим рефакторинг проблемных мест
3. Для устранения проблем с отсутствием автоматизации необходимо подключить автоматизацию и изменить код для ее использования
4. Для устранения проблем с неэффективными средствами и запытанний архитектурой необходимо пересмотреть способы решения задач и согласно этому провести оптимизацию
5. Для устранения несоответствия документации необходимо пересмотреть документацию, после чего либо отредактировать документацию (не наш случай), либо создать User story для исправления функционала в последующий спринтах
6. Для устранения отсутствия тестовой среды необходимо выбрать фреймворк для тестирования и написать набор тестов ключевой бизнес логики, после чего вести контроль и повышать уровень тестового покрытия
7. Для устранения отсутствия CI необходимо создать гитхаб-действия на коммиты в репозиторий для сборки и запуска тестов


## 3 СРАВНЕНИЕ И ОБОСНОВАНИЕ

Общая оценка сложность устранения текущего долга - 21 стори-поинт. Неимплементированных фич - 34 стори-поинта. Следовательно обЪем долга - 38% от всех запланированных задач (55 стори-поинтов).

Эксперты советуют держать уровень технического долга на уровне 10%, что значительно ниже полученного уровня, следовательно требуются мероприятия по устранению.
