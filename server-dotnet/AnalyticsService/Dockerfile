# Use the official SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all project files (csproj, source, etc.) from the subdirectory
# This ensures a clean copy of all necessary project structure is present for restore/publish.
COPY *.csproj ./


RUN dotnet restore

COPY . .


RUN dotnet publish --configuration $BUILD_CONFIGURATION --output /app/publish


# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Define the entry point for the application
ENTRYPOINT ["dotnet", "AnalyticsService.dll"]